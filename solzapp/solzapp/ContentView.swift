import SwiftUI
import HealthKit

struct ContentView: View {
    @Environment(\.openURL) var openURL
    @State private var username: String = ""
    @State private var keyboardHeight: CGFloat = 0
    let healthKitManager = HealthKitManager()

    var body: some View {
        ScrollView {
            GeometryReader {geometry in
                VStack (alignment:.leading){
                    // Title at the top
                    HStack {
                        Spacer()
                        Image("SOLZ") //replace with logo
                            .resizable()
                            .frame(width: 225, height: 125)
                        Spacer()
                    }.padding(.top, 20)
                    
                    Text("Welcome!")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.horizontal, 35)
                    
                    Text("To get your medical assessment, \n\nStep 1: Allow access to the health app \n\nStep 2: Enter your username\n\nStep 3: Tap the button to go to our assessment website \n\nStep 4: To verify security, we'll send you an authentication code through Auth0")
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
                            Text("Get Assessment")
                                .font(.title2)
                                .padding()
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .frame(width: 300)
                                .fontWeight(.bold)
                        }
                        .background(Color.white)
                        .cornerRadius(20)
                        .padding()
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
            healthKitManager.fetchHealthKitData { data, error in
                guard var data = data else {
                    print("Error fetching HealthKit data: \(String(describing: error))")
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
                    return
                }

                // Send the request
                URLSession.shared.dataTask(with: request) { _, _, error in
                    if let error = error {
                        print("Error posting data: \(error.localizedDescription)")
                        return
                    }

                    print("Successfully posted full HealthKit data!")

                    // Open the website
                    DispatchQueue.main.async {
                        if let webURL = URL(string: "https://google.com/") {
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
