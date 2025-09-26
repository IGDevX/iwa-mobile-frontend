# Expo app

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Git

1. Initiate and Update to pull latest submodule version
   ```bash
   git submodule init
   git submodule update
   ```

2. Move to needed submodule folder (-b : create new branch if needed)
   ```bash
   git checkout -b <branch name>
   ```

3. Add and Commit your modification
   ```bash
   git add .
   git commit -m "<type>: <description>" 
   ```

4. Push your modifications
   ```bash
   git push --set-upstream origin frontend-expo-setup
   ```