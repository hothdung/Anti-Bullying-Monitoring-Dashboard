//
//  InterfaceController.swift
//  AudioAppTest WatchKit Extension
//
//

import WatchKit
import Foundation
import AVFoundation
import Alamofire
import SwiftyJSON

class InterfaceController: WKInterfaceController, AVAudioRecorderDelegate, AVAudioPlayerDelegate{
    
    
    @IBOutlet weak var recordBtn: WKInterfaceButton!
    var recordSession: AVAudioSession!
    var audioRecorder: AVAudioRecorder!
    var audioPlayer: AVAudioPlayer!
    var settings = [String : Int]()
    
    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
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
                    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
    }
    
    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
    }
    
    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }
    
    func getDocumentsDirectory()-> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        let documentDirectory = paths[0]
        return documentDirectory
    }
    
    func getAudioURL() -> URL {
        let filename = NSUUID().uuidString+".m4a"
        return getDocumentsDirectory().appendingPathComponent(filename)
    }
    
    func startRecording(){
        
        do{
            let audioURL = self.getAudioURL()
             print("first \(audioURL)")
            audioRecorder = try AVAudioRecorder(url:self.getAudioURL(),settings:settings)
            audioRecorder.delegate = self
            audioRecorder.record(forDuration: 15)
        }catch{
            finishRecording(success: false)
        }
    }
    
    func finishRecording(success: Bool){
        audioRecorder.stop()
        if success{
            print("Recorded successfully!")
        }else{
            audioRecorder = nil
            print("Recording failed!")
        }
        
    }
    
    @IBAction func recordListener() {
        print("Button clicked!")
        if audioRecorder == nil{
            self.startRecording()
        }else{
            self.finishRecording(success: true)
        }
    }
    
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        if !flag{
            finishRecording(success:false)
        }
        var studentId = "student1234"
        var date = "2020-05-13"
        print("What is this url \(recorder.url)")
        sendAudio(audioPath: recorder.url)
        audioRecorder = nil
        startRecording()
        
    }
    
    func preparePlayer(){
        do{
            audioPlayer = try AVAudioPlayer(contentsOf: audioRecorder.url)
            audioPlayer.delegate = self
            audioPlayer.prepareToPlay()
            audioPlayer.volume = 5.0
        }catch{
            if let err = error as Error?{
                print("AVAudioPlayer error: \(err.localizedDescription)")
            }
        }
    }
    
    
    
    func sendAudio(audioPath: URL){
        
        guard let apiURL = URL(string:"http://147.46.215.219:8080/addAudio") else
        {
            print("URL could not be created!")
            return
        }
      
        // getting fileName
               let urlStr = "\(audioPath)"
               let pathArr = urlStr.components(separatedBy: "/")
        let fileName = String(pathArr.last!)
        
        // remove extension
        let tmp = fileName.components(separatedBy: ".")
        let withoutExt = String(tmp[0])
        
               
               print("Here is the fileName: \(fileName)")
        
        var params: Dictionary = ["studentId":"student1234", "data":"2020-05-13"]
    var result:(message:String, list:[[String: Any]],isSuccess:Bool) = (message: "Fail", list:[],isSuccess : false)

           let headers: HTTPHeaders
           headers = ["Content-type": "multipart/form-data",
                      "Content-Disposition" : "form-data"]
        do{
            let audioData = try Data(contentsOf: audioPath)
            
            AF.upload(multipartFormData: { (multipartFormData) in

                for (key, value) in params {
                    multipartFormData.append((value as! String).data(using: String.Encoding.utf8)!, withName: key)
                }
                        multipartFormData.append(audioData, withName: withoutExt, fileName: fileName, mimeType: "audio/mp4")
            }, to: "http://147.46.215.219:8080/addAudio", usingThreshold: UInt64.init(), method: .post, headers: headers).response{ response in

                if((response.error != nil))
               {
                    do
                    {
                        if let jsonData = response.data
                        {
                            let parsedData = try JSONSerialization.jsonObject(with: jsonData) as! Dictionary<String, AnyObject>
                            print(parsedData)

                            let status = parsedData["status"] as? NSInteger ?? 0
                            let msg = parsedData["message"] as? String ?? ""


                            if(status==1)
                            {
                                result.isSuccess = true
                                result.message=msg
                                if let jsonArray = parsedData["data"] as? [[String: Any]] {
                                    result.list=jsonArray
                                }
                            }
                            else
                            {
                                result.isSuccess = false
                                result.message=msg
                            }

                        }
                        print(result)
                    }
                    catch
                    {
                       print(result)
                    }
                }
                else
                {
                print(result)
                }

            }
            
        } catch {
            print("Cannot upload data \(error)")
        }
    }
                

        
        
        

    
  /**
    @IBAction func playPressed() {
        
        if audioRecorder != nil{
            if !audioRecorder.isRecording{
                preparePlayer()
                audioPlayer.play()
            }
            audioRecorder = nil
        }else{
            print("Empty file!")
        }
    }
    */
    
}
