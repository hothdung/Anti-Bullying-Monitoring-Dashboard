//
//  InterfaceController.swift
//  BullyingDetection WatchKit Extension
//
//  Created by Dung Ho and Jaeyoung Kim
//  Copyright © 2019 호탄융, 김재영. All rights reserved.
//
import WatchKit
import Foundation
import HealthKit
import AVFoundation
import CoreMotion

// generate a short unique id
struct ShortCodeGenerator {
    
    private static let base62chars = [Character]("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
    private static let maxBase : UInt32 = 62
    
    static func getCode(withBase base: UInt32 = maxBase, length: Int) -> String {
        var code = ""
        for _ in 0..<length {
            let random = Int(arc4random_uniform(min(base, maxBase)))
            code.append(base62chars[random])
        }
        return code
    }
}

// Date will be constructed in database --> server side
class InterfaceController: WKInterfaceController {
    
    var saveUrl: URL?
    
    // instance of locationOutside exist already at runtime
    var locationManager: LocationOutsideManager!
    // 5 m change --> significant change
    //let distanceChange: Double = 5
    //var lastCurrentLocation: CLLocation?
    var heartRateManager: HeartRateManager!
    
    // Outlets for testing
    @IBOutlet weak var button: WKInterfaceButton!
    @IBOutlet weak var furtherSigLabels: WKInterfaceLabel!
    var settings = [String : Any]()
    
    // distinguish start recording heartbeat
    var isRecording = false
    
    //For workout session
    var currentQuery: HKQuery?
    var filename: String?
    var motionManager: MovementManager!
    var movement: String = ""
    
    // fields for manual approach
    var manualLat: Double = 0.0
    var manualLong: Double = 0.0
    var manualBpm: Double = 0.0
    var manualGravity: String = ""
    var manualAcceleration: String = ""
    var manualRotation: String = ""
    var manualAttitude: String = ""
    var manualFallenDown: Bool = false
    
    
    var recordSession: AVAudioSession!
    var audioRecorder: AVAudioRecorder!
    var audioSettings = [String : Int]()
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        
        let healthService:HealthDataService = HealthDataService()
        healthService.authorizeHealthKitAccess { (success, error) in
            if success {
                print("HealthKit authorization received.")
            } else {
                print("HealthKit authorization denied!")
                if error != nil {
                    print("\(String(describing: error))")
                }
            }
        }
        heartRateManager = HeartRateManager(delegate: self)
        
        // setting audio recording component
        recordSession = AVAudioSession.sharedInstance()
        
        if(recordSession.responds(to:#selector(AVAudioSession.requestRecordPermission(_:)))){
            // configure audio settings
            AVAudioSession.sharedInstance().requestRecordPermission({(granted: Bool) -> Void in
                if granted{
                    print("Recording granted!")
                    
                    do{
                        try self.recordSession.setCategory(.playAndRecord,mode: .default, options: [])
                        try self.recordSession.setActive(true)
                    }catch{
                        print("Audio session could not be set!")
                    }
                }else{
                    print("Recording not granted!")
                }
            })
        }
        
        settings = [AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                    AVSampleRateKey: 12000,
                    AVNumberOfChannelsKey: 1,
                    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue]
        
        // initialize locationManager
        locationManager = LocationOutsideManager(delegate: self)
        motionManager = MovementManager(delegate: self)
    }
    
    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
        motionManager.startUpdatingMotions()
    }
    
    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
        motionManager.stopUpdatingMotions()
    }
    
    func sendToServer(params : Dictionary<String, Any>){
        print(params)
        guard let url = URL(string:"http://147.46.215.219:8080/addSignal") else
        { print("URL could not be created")
            return
        }
        let requestBody = try? JSONSerialization.data(withJSONObject: params,  options: [])
        
        var urlRequest = URLRequest(url: url)
        urlRequest.timeoutInterval = 240
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "test")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        urlRequest.httpBody = requestBody
        //print("Location:\(params)")
        
        let session = URLSession.shared
        
        let task = session.dataTask(with: urlRequest)
        task.resume()
        print("Sending completed!")
    }
    
    func sendSignal(signalParams: Dictionary<String,Any>){
        
        let jsonData = try? JSONSerialization.data(withJSONObject: signalParams)
        
        let session = URLSession.shared
        let url = URL(string:"http://147.46.215.219:8080/addSignal")
        var request = URLRequest(url:url!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json",forHTTPHeaderField: "Accept")
        request.httpBody = jsonData
        
        let dataTask = session.uploadTask(with:request, from:jsonData){ data,response,error in
            
            if let error = error{
                print("error: \(error)")
                return
            }
            
            guard let response = response as? HTTPURLResponse,
                (200...299).contains(response.statusCode) else{
                    print("Error at server side")
                    return
            }
            if let mimeType = response.mimeType,
                mimeType == "application/json",
                let data = data,
                let dataString = String(data: data, encoding: .utf8){
                print("returned data is \(dataString)")
            }
        }
        dataTask.resume()
    }
    
    
    func getCurrentDate() -> String{
        let date = Date()
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd HH:mm::ss"
        let dateString = df.string(from:date)
        
        return dateString;
    }
    
    @IBAction func manualBtnPressed() {
        
        let studentId = "student"+ShortCodeGenerator.getCode(length: 6)
        let txtMsg = "I am student \(studentId) (manually). I need help!"
        print(txtMsg)
        let date = getCurrentDate()
        var manualParam: Dictionary<String,Any>
        if(manualLat != 0  && manualLong != 0 && manualBpm != 0 && !manualGravity.isEmpty && !manualAcceleration.isEmpty && !manualRotation.isEmpty && !manualAttitude.isEmpty){
            manualParam = ["signalType": "manual", "long":manualLong, "lat":manualLat,"bpm": manualBpm, "gravity": manualGravity, "acceleration": manualAcceleration,"rotation":manualRotation, "attitude":manualAttitude,"fallenDown":manualFallenDown,"message": txtMsg,"date":date,"studentId":studentId] as [String : Any]
            
            sendSignal(signalParams: manualParam)
        }
        
    }
    
    // when button clicked label is shown
    @IBAction func btnPressed() {
        if(!isRecording){
            let stopTitle = NSMutableAttributedString(string: "Stop Recording")
            stopTitle.setAttributes([NSAttributedString.Key.foregroundColor: UIColor.red], range: NSMakeRange(0, stopTitle.length))
            button.setAttributedTitle(stopTitle)
            isRecording = true
            heartRateManager.startWorkout() //Start workout session/healthkit streaming
        } else {
            let exitTitle = NSMutableAttributedString(string: "Start Recording")
            exitTitle.setAttributes([NSAttributedString.Key.foregroundColor: UIColor.red], range: NSMakeRange(0, exitTitle.length))
            button.setAttributedTitle(exitTitle)
            isRecording = false
            heartRateManager.stopWorkout()
            //healthStore.end(session!)
            
        }
        
        print("Audio component on!")
        if audioRecorder == nil{
            self.startRecording()
        }else{
            //self.finishRecording(success: true)
            audioRecorder.stop()
            showUrls()
        }
        
    }
    
}


extension InterfaceController: LocationOutsideDelegate {
    
    func processNewLocation(newLocation: CLLocation) {
        /**
         let isSignificantChange = significantLocationChange(updatedLoc: newLocation)
         if isSignificantChange == false {
         print("No significant change in location data")
         return
         }
         */
        
        let latitude = newLocation.coordinate.latitude
        let longitude = newLocation.coordinate.longitude
        let date = self.getCurrentDate()
        let studentId = "student"+ShortCodeGenerator.getCode(length: 6)
        manualLat = latitude
        manualLong = longitude
        print("Latitude \(latitude)")
        print("Longitude \(longitude)")
        
        let locationParam: Dictionary = ["signalType": "locations", "long":longitude, "lat":latitude,"date":date,"studentId":studentId] as [String : Any]
        sendSignal(signalParams: locationParam)
    }
    
    func processLocationFailure(error: NSError) {
        print(error)
    }
}


extension InterfaceController: HeartRateManagerDelegate {
    
    func handleNewHeartRate(newHeartRate: Double) {
        print("New Heartrate \(newHeartRate)")
        let bpm = newHeartRate
        manualBpm = newHeartRate
        let date = self.getCurrentDate()
        let studentId = "student"+ShortCodeGenerator.getCode(length: 6)
        
        let heartrateParam: Dictionary = ["signalType": "heartrate", "bpm":bpm, "date":date,"studentId":studentId] as [String : Any]
        sendSignal(signalParams: heartrateParam)
    }
}


extension InterfaceController: MovementDelegate {
    
    func evalMovForSending(toSend: Bool, gravStr: String, accelStr: String, rotationStr: String, attStr: String){
        var movementParam: Dictionary<String,Any>
        let tmp = "\(gravStr), \(accelStr), \(rotationStr), \(attStr), "
        let studentId = "student"+ShortCodeGenerator.getCode(length: 6)
        let date:String
        if toSend{
            print("Student has fallen down!")
            movement = "\(tmp) _1"
            date = self.getCurrentDate()
            movementParam = ["signalType": "movements","gravity":gravStr,"acceleration":accelStr,"rotation":rotationStr,"attitude":attStr,"fallenDown":toSend,"date":date, "studentId":studentId]
            sendSignal(signalParams: movementParam)
            manualGravity = gravStr
            manualAcceleration = accelStr
            manualRotation = rotationStr
            manualAttitude = attStr
            manualFallenDown = toSend
            print(movement)
        }else{
            movement = "\(tmp) _2"
            date = self.getCurrentDate()
            movementParam = ["signalType": "movements","gravity":gravStr,"acceleration":accelStr,"rotation":rotationStr,"attitude":attStr,"fallenDown":toSend,"date":date, "studentId":studentId]
            sendSignal(signalParams: movementParam)
            manualGravity = gravStr
            manualAcceleration = accelStr
            manualRotation = rotationStr
            manualAttitude = attStr
            manualFallenDown = toSend
            print(movement)
        }
    }
}
extension InterfaceController: AVAudioRecorderDelegate{
    
    func getDocumentsDirectory()-> URL{
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        let documentDirectory = paths[0]
        return documentDirectory
    }
    
    func getAudioURL() -> URL{
        let fileName = NSUUID().uuidString+".m4a"
        return getDocumentsDirectory().appendingPathComponent(fileName)
    }
    
    func startRecording(){
        do{
            var counter = 0
            
            while counter < 20 {
                audioRecorder = try AVAudioRecorder(url:self.getAudioURL(), settings: settings)
                audioRecorder.delegate = self
                audioRecorder.record(forDuration:5)
                counter += 1
            }
        }catch let error{
            //finishRecording(success: false)
            print(error)
        }
    }
    
    func finishRecording(success: Bool){
        audioRecorder.stop()
        if success{
            print("Recorded successfully")
        }else{
            audioRecorder = nil
            print("Recording failed")
        }
    }
    
    /*
     func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
     if !flag{
     finishRecording(success: false)
     }
     print(recorder.url)
     }
     */
    
    
    func showUrls(){
        guard let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else{return}
        
        do{
            let contentOfDirectory = try FileManager.default.contentsOfDirectory(at: documentsDirectory, includingPropertiesForKeys: nil, options: [])
            print(contentOfDirectory)
        }catch{
            print("Could not list urls of files in documents directory: \(error)")
        }
    }
}






