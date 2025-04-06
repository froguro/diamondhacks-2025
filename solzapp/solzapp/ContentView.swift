import SwiftUI
import HealthKit

struct ContentView: View {
    @Environment(\.openURL) var openURL
    @State private var username: String = ""
    let healthKitManager = HealthKitManager()

    var body: some View {
        VStack {
            Text("Enter your username:")
            .font(.headline)
            .padding(.top)

            // TextField for username input
            TextField("Username", text: $username)
            .padding()
            .textFieldStyle(RoundedBorderTextFieldStyle())
            .frame(width: 300)
            Button(action: {
                sendHealthDataAndOpenWebsite(user: username)
            }) {
                Text("Go to Website")
                    .font(.title2)
                    .padding()
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .frame(width: 300)
            }
            .padding()
        }
        .padding()
        .onAppear {
            // Ask for HealthKit permissions on load
            healthKitManager.requestAuthorization { success, error in
                if success {
                    print("HealthKit authorization granted.")
                } else {
                    print("Authorization failed: \(String(describing: error))")
                }
            }
        }
    }

    func sendHealthDataAndOpenWebsite(user: String) {
        healthKitManager.fetchStepCount { steps, error in
            guard let steps = steps else {
                print("Could not fetch steps: \(String(describing: error))")
                return
            }

            // Build the POST request
            let urlString = "https://your-api-endpoint.com/submit" // Replace with your backend endpoint
            guard let url = URL(string: urlString) else { return }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let body: [String: Any] = [
                "stepCount": steps,
                "timestamp": Date().timeIntervalSince1970
            ]

            request.httpBody = try? JSONSerialization.data(withJSONObject: body)

            // Send the request
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    print("Error posting data: \(error.localizedDescription)")
                    return
                }

                print("Successfully posted step data!")

                // Open the website after sending
                DispatchQueue.main.async {
                    if let webURL = URL(string: "https://www.example.com?username=\(user)") {
                        openURL(webURL)
                    }
                }
            }.resume()
        }
    }
}


#Preview {
    ContentView()
}
