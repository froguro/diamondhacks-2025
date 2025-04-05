//
//  healthhackApp.swift
//  healthhack
//
//  Created by Larry Bui Tran on 4/5/25.
//

import SwiftUI

@main
struct healthhackApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: healthhackDocument()) { file in
            ContentView(document: file.$document)
        }
    }
}
