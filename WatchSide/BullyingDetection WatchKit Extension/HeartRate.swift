//
//  HeartRate.swift
//  BullyingDetection WatchKit Extension
//
//  Created by Dung Ho on 12.10.19.
//  Copyright © 2019 Dung Ho. All rights reserved.
//

import Foundation
import HealthKit

// heartrate sample type to share across classes
struct HeartRate{
 
    static let hrType:HKQuantityType = HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!
}

