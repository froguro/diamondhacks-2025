//
//  HealthKitManager.swift
//  solzapp
//
//  Created by Owen Lam on 4/5/25.
//

import HealthKit

class HealthKitManager {
    let healthStore = HKHealthStore()

    func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        if HKHealthStore.isHealthDataAvailable() {
            let readTypes: Set = [
                HKObjectType.quantityType(forIdentifier: .stepCount)!            ]

            healthStore.requestAuthorization(toShare: [], read: readTypes, completion: completion)
        }
    }

    func fetchStepCount(completion: @escaping (Double?, Error?) -> Void) {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            completion(nil, nil)
            return
        }

        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        let query = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
            guard let result = result, let sum = result.sumQuantity() else {
                completion(nil, error)
                return
            }
            completion(sum.doubleValue(for: HKUnit.count()), nil)
        }

        healthStore.execute(query)
    }
}
