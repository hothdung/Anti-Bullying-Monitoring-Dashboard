//
//  ViewController.swift
//  BullyingDetection
//
//  Created by Dung Ho and Jaeyoung Kim
//  Copyright © 호탄융,김재영. All rights reserved.
//
import UIKit
import CoreLocation
import WatchConnectivity

class ViewController: UIViewController {
    
    let locationManager = CLLocationManager()
    var lastFoundLocation: CLLocation?
    var session: WCSession?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view
        checkLocationServices()
        startSession()
    }
    
    func locationManagerConfig(){
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.allowsBackgroundLocationUpdates = true
    }
    
    func checkLocationServices(){
        if CLLocationManager.locationServicesEnabled(){
            locationManagerConfig()
            checkLocationAuthorization()
        }else{
            print("Set your location service")
        }
    }
    
    func checkLocationAuthorization(){
        switch CLLocationManager.authorizationStatus(){
        case .authorizedWhenInUse:
            locationManager.requestLocation()
            break
        case .restricted, .denied:
            let title = "Location services are disabled!"
            let message = "Please enable locations for this app via settings on your phone"
            
            let alertController = UIAlertController(title: title, message: message, preferredStyle: .alert)
            
            // cancelling the action
            let cancelAction = UIAlertAction(title:"Cancel", style:.cancel, handler:nil)
            alertController.addAction(cancelAction)
            present(alertController,animated:true,completion:nil)
            break
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
            break
        case .authorizedAlways:
            locationManager.requestAlwaysAuthorization()
            break
        default:
            print("This case is not available")
        }
    }
    
    private func locationDistanceChange(updatedLocation: CLLocation)-> Bool{
        guard let lastQueriedLocation = lastFoundLocation else{
            return true
        }
        let distance = lastQueriedLocation.distance(from: updatedLocation)
        // more than ... meters --> distinct new location
        return distance > 25
    }
    
    private func updateBullyingLocation(location:CLLocation){
        // user location changed significantly? compare with last time queried one
        if locationDistanceChange(updatedLocation: location) == false {
            return
        }
        // significant change in location
        print("current location changed and will be stored!")
        self.lastFoundLocation = location
    }
    
    private func startSession(){
        if(WCSession.isSupported()){
            session?.delegate = self
            session?.activate()
        }
    }
    
    func updateSessionLocationInfo(location: CLLocation){
        guard let session = session else {return}
        print("Set application context in iPhone: (applicationContext)")
        do{
            // encoding location coordinates
            let data = try NSKeyedArchiver.archivedData(withRootObject: location, requiringSecureCoding: false)
            // dictionary object to store location data
            let context = ["lastFoundlocation": data]
            
            do{
                // update session object's application context & prepare to send context to watchKit extension
                try session.updateApplicationContext(context)
            }catch{
                print("Update application context failed.")
            }
            
        }catch{
            print("Could not write file")
        }
    }
    
    override func viewWillAppear(_ animated:Bool){
        super.viewWillAppear(animated)
        locationManager.startUpdatingLocation()
    }
    
    override func viewWillDisappear(_ animated: Bool){
        super.viewWillAppear(animated)
        locationManager.stopUpdatingLocation()
    }
    
}

extension ViewController: CLLocationManagerDelegate{
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let recentlocation = locations.last else{ return }
        // pass location coordinates for session object
        updateSessionLocationInfo(location: recentlocation)
        // taking the user's last location and check whether distinct change & further proceed with it
        updateBullyingLocation(location: recentlocation)
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        checkLocationAuthorization()
    }
    
    // facing issue when fetching location information
    func locationManager(_ manager: CLLocationManager, didFailWithError error: NSError){
        if error.code == CLError.locationUnknown.rawValue{
            return
        }
        print("Failing to fetch valid location information: \(error)")
    }
}

extension ViewController: WCSessionDelegate{
    func sessionDidBecomeInactive(_ session: WCSession) {
        
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
      
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    
    }
    
   
}



