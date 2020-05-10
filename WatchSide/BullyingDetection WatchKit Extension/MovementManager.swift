//
//  MovementManager.swift
//  BullyingDetection WatchKit Extension
//
//  Created by Dung Ho on 10.10.19.
//  Copyright © 2019 Dung Ho. All rights reserved.
//

import WatchKit
import Foundation
import CoreMotion

protocol MovementDelegate{
   
    func evalMovForSending(toSend: Bool,gravStr: String, accelStr: String,rotationStr: String, attStr: String)
}

class MovementManager: NSObject {
    
    let motionManager = CMMotionManager()
    var delegate: MovementDelegate
    let queue = OperationQueue()

   
    var prev_grav_z: Double
    var prev_acc_z: Double
    var grav_x: Double
    var grav_y: Double
    var grav_z: Double
    var acc_x: Double
    var acc_y: Double
    var acc_z: Double
    var sendOrNot: Bool

    var gravityStr = ""
    var userAccelerStr = ""
    var rotationRateStr = ""
    var attitudeStr = ""
    var movement = ""
    
    init(delegate: MovementDelegate){
        self.delegate = delegate
        self.prev_grav_z = 0.0
        self.prev_acc_z = 0.0
        self.grav_x = 0.0
        self.grav_y = 0.0
        self.grav_z = 0.0
        self.acc_x = 0.0
        self.acc_y = 0.0
        self.acc_z = 0.0
        self.sendOrNot = false
        self.gravityStr = ""
        self.userAccelerStr = ""
        self.rotationRateStr = ""
        self.attitudeStr = ""
        self.movement = ""
        super.init()

        motionManager.deviceMotionUpdateInterval = 0.5
    }

    
    func startUpdatingMotions(){
        motionManager.startDeviceMotionUpdates(to: queue) { (deviceMotion: CMDeviceMotion?, error: Error?) in
            if error != nil {
                print("Encountered error: \(error!)")
            }
            if deviceMotion != nil {
                self.buildCoordinateStr(x:(deviceMotion?.gravity.x)!,y:(deviceMotion?.gravity.y)!, z: (deviceMotion?.gravity.z)!, motionKind: "G")

                if self.prev_grav_z == 0.0 {
                    self.prev_grav_z = self.grav_z
                    self.sendOrNot = true

                    print(self.gravityStr)
                }
                else{
                    if (self.grav_z - self.prev_grav_z) <= -0.25{
                        self.sendOrNot = true
                    }
                    else{
                        self.sendOrNot = false
                    }
                    self.prev_grav_z = self.grav_z
                }
                self.buildCoordinateStr(x: (deviceMotion?.userAcceleration.x)!, y: (deviceMotion?.userAcceleration.y)!, z: (deviceMotion?.userAcceleration.z)!, motionKind: "U")

                if (self.acc_z - self.prev_acc_z) <= -0.2{
                    //print("Accelero_z: ",self.acc_z, self.prev_acc_z)
                    self.sendOrNot = true
                    print(self.userAccelerStr)

                }
                else{
                    self.sendOrNot = false
                }
                self.prev_acc_z = self.acc_z
                self.buildCoordinateStr(x: (deviceMotion?.rotationRate.x)!, y: (deviceMotion?.rotationRate.y)!, z: (deviceMotion?.rotationRate.z)!, motionKind: "R")

                print(self.rotationRateStr)

                self.buildCoordinateStr(x:(deviceMotion?.attitude.roll)! , y: (deviceMotion?.attitude.pitch)!, z: (deviceMotion?.attitude.yaw)!, motionKind: "A")
                print(self.attitudeStr)
                self.delegate.evalMovForSending(toSend: self.sendOrNot,gravStr: self.gravityStr,accelStr: self.userAccelerStr,rotationStr: self.rotationRateStr,attStr: self.attitudeStr )
                self.sendOrNot = self.flip()
            }
        }
    }
    
    
    // setting the each coordinates from the movement components and building coordinate string for information conveyance
    func buildCoordinateStr(x:Double,y:Double,z:Double, motionKind: Character){
        
        switch motionKind{
        case "G":
            self.grav_x = x
            self.grav_y = y
            self.grav_z = z
            self.gravityStr = String(format: "grav_x: %.2f, grav_y: %.2f, grav_z: %.2f" ,self.grav_x,self.grav_y,self.grav_z)
            break
        case "U":
            self.acc_x = x
            self.acc_y = y
            self.acc_z = z
            self.userAccelerStr = String(format: "acc_x: %.2f, acc_y: %.2f, acc_z: %.2f" ,self.acc_x,self.acc_y,self.acc_z)
            break
        case "R":
            self.rotationRateStr = String(format: "rota_x: %.2f, rota_y: %.2f, rota_z: %.2f" ,x,y,z)
            break
        case "A":
            self.attitudeStr = String(format: "atti_roll: %.1f, atti_pitch: %.1f, atti_yaw: %.1f" ,x,y,z)
            break
        default:
            print("Not found!")
        }
        
    }
    
    func flip() -> Bool{
        return false
    }
    
    func stopUpdatingMotions(){
        motionManager.stopDeviceMotionUpdates()
    }
    
}

