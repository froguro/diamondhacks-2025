//
//  ContentView.swift
//  solzapp
//
//  Created by Owen Lam on 4/5/25.
//

import SwiftUI

struct ContentView: View {
    @State private var username: String = ""  // To store the username input
        @Environment(\.openURL) var openURL

        var body: some View {
            VStack {
                
                Text("Welcome to SOLZ")
                    .font(.headline)
                    .padding(.top)
                
                // TextBox for username input
                TextField("Enter your username", text: $username)
                    .padding()
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .frame(width: 300)

                // Button to go to the website
                Button(action: {
                    // Check if the username is not empty
                    if !username.isEmpty,
                       let url = URL(string: "https://www.example.com?username=\(username)") {
                        openURL(url)
                    }
                }) {
                    Text("Go to Website")
                        .font(.title2)
                        .padding()
                        .foregroundColor(.white)
                        .background(Color.black)
                        .cornerRadius(12)
                }
                .padding(.top, 20)
            }
            .padding()
        }
}


#Preview {
    ContentView()
}
