//
//  HeartRateManager.swift
//  BullyingDetection WatchKit Extension
//
//  Created by 호탄융, 김재영, 김지환 on 13.10.19.
//  Copyright © 2019 호탄융, 김재영, 김지환. All rights reserved.
//

import Foundation
import HealthKit

protocol HeartRateManagerDelegate {
    func handleNewHeartRate(newHeartRate:Double)
}

class HeartRateManager: NSObject{
    let healthService: HealthDataService = HealthDataService()
    let heartRateManager = HKHealthStore()
    var delegate: HeartRateManagerDelegate
    var session: HKWorkoutSession?
    var currentQuery: HKQuery?

    init(delegate: HeartRateManagerDelegate){
        self.delegate = delegate
        super.init()
    }
    
    func startWorkout(){
        // If a workout has already been started, do nothing.
        if (session != nil) {
            return
        }
        // Configure the workout session.
        let workoutConfiguration = HKWorkoutConfiguration()
        workoutConfiguration.activityType = .running
        workoutConfiguration.locationType = .outdoor

        do {
            //session = try HKWorkoutSession(configuration: workoutConfiguration)
            session = try HKWorkoutSession(healthStore: heartRateManager, configuration: workoutConfiguration)
            session?.delegate = self
        } catch {
            fatalError("Unable to create workout session")
        }

        //heartRateManager.start(self.session!)
        session?.startActivity(with: Date())

    }
    
    func stopWorkout(){
        if(session == nil){
            return
        }

        //heartRateManager.end(session!)
        session = nil
    }
    
    // query for heartrate values
    func heartRateQuery(_ startDate: Date) -> HKQuery? {
        let datePredicate = HKQuery.predicateForSamples(withStart: startDate, end: nil, options: .strictEndDate)

        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates:[datePredicate])
        
        let heartRateQuery = HKAnchoredObjectQuery(type: HeartRate.hrType, predicate: predicate, anchor: nil, limit: Int(HKObjectQueryNoLimit)) { (query, sampleObjects, deletedObjects, newAnchor, error) -> Void in
            //Do nothing
        }
        
        heartRateQuery.updateHandler = {(query, samples, deleteObjects, newAnchor, error) -> Void in
            guard let samples = samples as? [HKQuantitySample] else {return}
            DispatchQueue.main.async {
                guard let sample = samples.first else { return }
                
                // after extraction of bpm value conversion to double
                let value = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
                self.delegate.handleNewHeartRate(newHeartRate: value)
            }
            
        }
        
        return heartRateQuery
    }
    
    
    
}

extension HeartRateManager: HKWorkoutSessionDelegate{
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        switch toState {
        case .running:
            //print(date)
            if let query = heartRateQuery(date){
                self.currentQuery = query
                heartRateManager.execute(query)
            }
        //Execute Query
        case .ended:
            //Stop Query
            heartRateManager.stop(self.currentQuery!)
            session = nil
        default:
            print("Unexpected state: \(toState)")
        }
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        fatalError(error.localizedDescription)
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didGenerate event: HKWorkoutEvent) {
        print("\(event) generated!")
    }
}



