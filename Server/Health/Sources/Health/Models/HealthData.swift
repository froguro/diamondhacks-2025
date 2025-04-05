import Vapor
import MongoKitten

struct HealthData: Content {
    let userId: String
    let type: String
    let value: Double
    let timestamp: Date
}
