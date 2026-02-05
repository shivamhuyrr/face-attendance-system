# Purpose and Real-Life Impact

## user Problem

Traditional attendance systems (Paper logs, ID cards, Biometrics) have flaws:

* **Paper**: Easily faked ("Buddy Punching"), hard to digitize.
* **ID Cards**: Can be lost or given to a friend to swipe.
* **Fingerprint**: Contact-based (Hygiene concerns), slow during rush hour.

## The Solution: Contactless Face Attendance

This system uses **AI Computer Vision** to recognize an employee's face instantly as they walk by a camera.

## Real-Life Impact

### 1. 🚀 Efficiency

* **Speed**: Recognizes a face in < 200ms. No queuing at the entrance.
* **Passive**: Employees don't need to stop or touch anything.

### 2. 🛡️ Security & Integrity

* **Anti-Spoofing**: Images are captured as "Evidence" (`logs` bucket), allowing Admins to audit logs (verifying it wasn't a photo held up to the camera).
* **Immutable Logs**: Once recorded in Supabase, logs provide a reliable history.

### 3. 📱 Accessibility

* **Mobile Dashboard**: Admins can check attendance from their phones (via the React App) from anywhere in the world.

### 4. 💰 Cost Effective

* **No Hardware**: Uses standard Webcams/CCTV, no expensive biometric sensors needed.
* **Cloud Scalet**: Supabase allows scaling to thousands of users without managing servers.
