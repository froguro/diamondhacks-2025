import SwiftUI
import HealthKit

struct ContentView: View {
    @Environment(\.openURL) var openURL
    @State private var username: String = ""
    @State private var keyboardHeight: CGFloat = 0
    @State private var isSending: Bool = false // State to track if data is being sent
    @State private var feedbackMessage: String? = nil // State to show feedback message
    let healthKitManager = HealthKitManager()

    var body: some View {
        ScrollView {
            GeometryReader { geometry in
                VStack(alignment: .leading) {
                    // Title at the top
                    HStack {
                        Spacer()
                        Image("SOLZ") // Replace with logo
                            .resizable()
                            .frame(width: 225, height: 125)
                        Spacer()
                    }.padding(.top, 20)

                    Text("Welcome!")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.horizontal, 35)

                    Text("To get your medical assessment, \n\nStep 1: Allow access to the health app \n\nStep 2: Enter your username\n\nStep 3: Tap the button to go to our assessment website")
                        .font(.headline)
                        .fontWeight(.bold)
                        .padding(.top, 3)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, 40)

                    VStack {
                        Text("Enter Username")
                            .font(.title2)
                            .padding(.top)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.white)

                        // TextField for username input
                        TextField("Username", text: $username)
                            .padding()
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 325)

                        Button(action: {
                            sendHealthDataAndOpenWebsite(user: username)
                        }) {
                            if isSending {
                                ProgressView() // Show a loading spinner while sending
                                    .progressViewStyle(CircularProgressViewStyle())
                            } else {
                                Text("Get Assessment")
                                    .font(.title2)
                                    .padding()
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .frame(width: 300)
                                    .fontWeight(.bold)
                            }
                        }
                        .background(Color.white)
                        .cornerRadius(20)
                        .padding()
                        .disabled(isSending) // Disable the button while sending

                        // Feedback message
                        if let feedbackMessage = feedbackMessage {
                            Text(feedbackMessage)
                                .font(.body)
                                .foregroundColor(.green)
                                .padding(.top, 5)
                        }
                    }
                    .background(Color.blue.opacity(0.90))
                    .cornerRadius(20)
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
                    .frame(width: geometry.size.width)
                }
            }
            .padding(.bottom, keyboardHeight)
            .offset(y: -keyboardHeight)
            .animation(.easeOut(duration: 0.25), value: keyboardHeight)
        }
        .onAppear {
            NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: .main) { notif in
                if let frame = notif.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect {
                    keyboardHeight = frame.height
                }
            }
            NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main) { _ in
                keyboardHeight = 0
            }
        }
    }

    func sendHealthDataAndOpenWebsite(user: String) {
        isSending = true // Start sending
        feedbackMessage = nil // Clear previous feedback

        healthKitManager.fetchHealthKitData { data, error in
            guard var data = data else {
                print("Error fetching HealthKit data: \(String(describing: error))")
                isSending = false // Stop sending
                feedbackMessage = "Failed to fetch HealthKit data."
                return
            }

            data["username"] = user // Add username to payload

            // Build the POST request
            let urlString = "https://diamondhacks-2025.onrender.com/api/submit-health-data" // Replace with your backend endpoint
            guard let url = URL(string: urlString) else { return }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: data, options: [])
            } catch {
                print("Error serializing JSON: \(error.localizedDescription)")
                isSending = false // Stop sending
                feedbackMessage = "Failed to prepare data for submission."
                return
            }

            // Send the request
            URLSession.shared.dataTask(with: request) { _, response, error in
                DispatchQueue.main.async {
                    isSending = false // Stop sending
                }

                if let error = error {
                    print("Error posting data: \(error.localizedDescription)")
                    DispatchQueue.main.async {
                        feedbackMessage = "Failed to send data. Please try again."
                    }
                    return
                }

                print("Successfully posted full HealthKit data!")
                DispatchQueue.main.async {
                    feedbackMessage = "Data successfully sent to the database!"
                }
            }.resume()
        }
    }
}

#Preview {
    ContentView()
}
