//
//  HealthDataService.swift
//  BullyingDetection WatchKit Extension
//
//  Created by Dung Ho on 12.10.19.
//  Copyright © 2019 Dung Ho. All rights reserved.
//

import Foundation
import HealthKit

class HealthDataService {
    
    internal let healthKitStore:HKHealthStore = HKHealthStore()
    
    init() {}
    
    func authorizeHealthKitAccess(_ completion: ((_ success:Bool, _ error:Error?) -> Void)!) {
        let typesToShare = Set([HeartRate.hrType])
        let typesToSave = Set([HeartRate.hrType])
        healthKitStore.requestAuthorization(toShare: typesToShare, read: typesToSave) { (success, error) in
            completion(success, error)
        }
    }
}

