//
//  LocationOutside.swift
//  BullyingDetection WatchKit Extension
//
//  Created by Dung Ho on 06.10.19.
//  Copyright © 2019 Dung Ho. All rights reserved.
//

import WatchKit
import Foundation
import CoreLocation
import WatchConnectivity

protocol LocationOutsideDelegate {
   
    func processNewLocation(newLocation:CLLocation)
    func processLocationFailure(error:NSError)
}

class LocationOutsideManager: NSObject {
    
    let locationManager = CLLocationManager()
    var delegate: LocationOutsideDelegate
    let authorizationStatus = CLLocationManager.authorizationStatus()
    private var session: WCSession?
    private var lastFoundLocation: CLLocation?
    
    
    // setting up the delegate
    init(delegate:LocationOutsideDelegate){
        self.delegate = delegate
        super.init()

        // location service is "on" on users device
        if CLLocationManager.locationServicesEnabled() {
            locationManager.delegate = self
            // fast, but lower accuracy
            locationManager.desiredAccuracy =  kCLLocationAccuracyBest
            checkLocationAuthorization(status: authorizationStatus)
        }
        
        if let lastUpdatedLocation = lastFoundLocation{
            queryWatchLocation(location: lastUpdatedLocation)
        }
        startSession()
    }
    
    func locationDistanceChanged(updatedLocation: CLLocation)-> Bool{
        guard let lastUpdatedLocation = lastFoundLocation else{
            return true
        }
        let distance = lastUpdatedLocation.distance(from: updatedLocation)
        return distance > 25
    }
    
    private func queryWatchLocation(location: CLLocation){
        // distance has changed?
        if locationDistanceChanged(updatedLocation: location)==false{
            return
        }
        // Store current location for next time
        print("WatchKit: Current location has been changed.")
        
        lastFoundLocation = location
        // get changed location
        delegate.processNewLocation(newLocation: location)
    }
    
    func checkLocationAuthorization(status: CLAuthorizationStatus){
        
        switch status {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .restricted, .denied:
            print("Location disabled \n\n Enable locations for this app via settings in your phone.")
        case .authorizedAlways, .authorizedWhenInUse:
            locationManager.requestLocation()
        default:
            break
        }
    }
    
    private func startSession(){
        if(WCSession.isSupported()){
            // getting current session object for device
            session = WCSession.default
            session?.delegate = self
            session?.activate()
            
        }
    }
    
    func session(session: WCSession,didReceiveApplicationContext applicationContext:[String: AnyObject]){
        print("WatchKit: Received application context: (applicationContext)")
        guard let data = applicationContext["lastFoundLocation"] as? NSData else { return }
    }
}

extension LocationOutsideManager: CLLocationManagerDelegate {

    // whenever authorization changes we want to check for state
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        checkLocationAuthorization(status: status)
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // just interested in last and recent location in loc array
        guard let mostRecentLocation = locations.last else{ return }
        queryWatchLocation(location: mostRecentLocation)
    }
    

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let locationError = error as? CLError else {
            print("other error: ", error.localizedDescription)
            return
        }

        switch locationError {
        case CLError.locationUnknown:
            delegate.processLocationFailure(error: locationError as NSError)
            print("location unknown")
        case CLError.denied:
            delegate.processLocationFailure(error: locationError as NSError)
            print("denied")
        default:
            delegate.processLocationFailure(error: locationError as NSError)
            print("other Core Location error")
        }
        
        delegate.processLocationFailure(error: locationError as NSError)
    }
}

extension LocationOutsideManager: WCSessionDelegate{
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    }
    
}

