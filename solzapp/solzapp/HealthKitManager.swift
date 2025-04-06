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
                HKObjectType.quantityType(forIdentifier: .stepCount)!,
                HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
                HKObjectType.quantityType(forIdentifier: .flightsClimbed)!,
                HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
                HKObjectType.quantityType(forIdentifier: .basalEnergyBurned)!,
                HKObjectType.quantityType(forIdentifier: .heartRate)!,
                HKObjectType.quantityType(forIdentifier: .restingHeartRate)!,
                HKObjectType.quantityType(forIdentifier: .walkingHeartRateAverage)!,
                HKObjectType.quantityType(forIdentifier: .bodyTemperature)!,
                HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
                HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic)!,
                HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
            ]

            healthStore.requestAuthorization(toShare: [], read: readTypes, completion: completion)
        }
    }

    func fetchHealthKitData(completion: @escaping ([String: Any]?, Error?) -> Void) {
        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        let dispatchGroup = DispatchGroup()
        var results: [String: Any] = [:]
        var fetchError: Error?

        // Helper for quantity types
        func fetchQuantity(_ id: HKQuantityTypeIdentifier, unit: HKUnit, key: String) {
            guard let type = HKQuantityType.quantityType(forIdentifier: id) else { return }
            dispatchGroup.enter()
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
                if let error = error { fetchError = error }
                let value = result?.sumQuantity()?.doubleValue(for: unit) ?? 0
                results[key] = value
                dispatchGroup.leave()
            }
            healthStore.execute(query)
        }

        // Heart rate average (discrete average)
        func fetchAverageQuantity(_ id: HKQuantityTypeIdentifier, unit: HKUnit, key: String) {
            guard let type = HKQuantityType.quantityType(forIdentifier: id) else { return }
            dispatchGroup.enter()
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .discreteAverage) { _, result, error in
                if let error = error { fetchError = error }
                let value = result?.averageQuantity()?.doubleValue(for: unit) ?? 0
                results[key] = value
                dispatchGroup.leave()
            }
            healthStore.execute(query)
        }

        // Sleep
        func fetchSleepHours() {
            guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { return }
            dispatchGroup.enter()
            let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                if let error = error {
                    fetchError = error
                } else {
                    let sleepSamples = samples as? [HKCategorySample] ?? []
                    let totalSeconds = sleepSamples
                        .filter { $0.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue }
                        .reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) }
                    results["hoursOfSleep"] = totalSeconds / 3600
                }
                dispatchGroup.leave()
            }
            healthStore.execute(query)
        }

        // Fetch all required metrics
        fetchQuantity(.stepCount, unit: .count(), key: "stepCount")
        fetchQuantity(.distanceWalkingRunning, unit: .meter(), key: "distanceWalkingRunning")
        fetchQuantity(.activeEnergyBurned, unit: .kilocalorie(), key: "activeEnergy")
        fetchQuantity(.basalEnergyBurned, unit: .kilocalorie(), key: "restingEnergy")
        fetchQuantity(.flightsClimbed, unit: .count(), key: "flightsClimbed")
        fetchAverageQuantity(.heartRate, unit: HKUnit.count().unitDivided(by: .minute()), key: "heartRate")
        fetchAverageQuantity(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute()), key: "restingHeartRate")
        fetchAverageQuantity(.walkingHeartRateAverage, unit: HKUnit.count().unitDivided(by: .minute()), key: "walkingHeartRateAvg")
        fetchAverageQuantity(.bodyTemperature, unit: .degreeCelsius(), key: "bodyTemperature")
        fetchAverageQuantity(.bloodPressureDiastolic, unit: .millimeterOfMercury(), key: "bloodPressureDiastolic")
        fetchAverageQuantity(.bloodPressureSystolic, unit: .millimeterOfMercury(), key: "bloodPressureSystolic")
        fetchSleepHours()

        dispatchGroup.notify(queue: .main) {
            results["timestamp"] = Int(Date().timeIntervalSince1970)
            completion(results, fetchError)
        }
    }
}
