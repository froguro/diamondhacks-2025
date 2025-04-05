//
//  ContentView.swift
//  healthhack
//
//  Created by Larry Bui Tran on 4/5/25.
//

import SwiftUI

struct ContentView: View {
    @Binding var document: healthhackDocument

    var body: some View {
        TextEditor(text: $document.text)
    }
}

#Preview {
    ContentView(document: .constant(healthhackDocument()))
}
