//
//  InterfaceController.swift
//  AudioAppTest WatchKit Extension
//
//

import WatchKit
import Foundation
import AVFoundation


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
        let apiURL = URL(string:"http://147.46.215.219:8080/addAudio")
        let recordingData: Data? = try? Data(contentsOf:audioPath)
        let boundary = "---011000010111000001101001"
        let startBoundary = "--\(boundary)"
        let endingBoundary = "--\(boundary)--"
        
        // getting the fileName
        let urlStr = "\(audioPath)"
        let pathArr = urlStr.components(separatedBy: "/")
        let fileName = pathArr.last
        
        
        var body = Data()
        var header = "Content-Disposition: form-data; name=\"\(fileName)\"; filename=\"\(audioPath)\"\r\n"
        
        body.append(("\(startBoundary)\r\n" as String).data(using:.utf8)!)
        body.append((header as String).data(using:.utf8)!)
        body.append(("Content-Type: application/octet-stream\r\n\r\n" as String).data(using:.utf8)!)
        body.append(recordingData!)
        body.append(("\r\n\(endingBoundary)\r\n" as String).data(using:.utf8)!)
        
        var request = URLRequest(url:apiURL!)
            request.httpMethod = "POST"
            request.setValue("multipart/form-data;boundary=\(boundary)",forHTTPHeaderField: "Content-Type")
            request.setValue("application/json",forHTTPHeaderField: "Accept")
        
        let session = URLSession.shared
        
        let task = session.dataTask(with: request){ (data, response,error) in
            print("Upload complete!")
            
            if let error = error{
                print("error: \(error)")
                return
            }
            
            guard let response = response as? HTTPURLResponse,
                (200...299).contains(response.statusCode) else {
                    print("Error on server side!")
                    return
            }
            
            if let mimeType = response.mimeType,
            mimeType == "audio/m4a",
            let data = data,
                let dataStr = String(data: data, encoding: .utf8){
                print("data is \(dataStr)")
            }
        }
        task.resume()
        
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
