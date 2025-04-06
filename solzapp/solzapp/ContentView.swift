//
//  ContentView.swift
//  solzapp
//
//  Created by Owen Lam on 4/5/25.
//

import SwiftUI

struct ContentView: View {
    @Environment(\.openURL) var openURL

    var body: some View {
        VStack {
            Button(action: {
                if let url = URL(string: "https://www.example.com") {
                    openURL(url)
                }
            }) {
                Text("Go to Website")
                    .font(.title2)
                    .padding()
                    .foregroundColor(.white)
                    .background(Color.blue)
                    .cornerRadius(12)
            }
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
