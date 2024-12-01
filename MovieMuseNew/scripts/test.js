const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const runTests = () => {
  console.log('🚀 Starting app tests...\n');

  // Check if Android build exists
  const androidBuildPath = path.join(__dirname, '../android/app/build');
  if (!fs.existsSync(androidBuildPath)) {
    console.log('⚙️  Android build not found, running Android build...');
    execSync('cd android && ./gradlew assembleDebug', {stdio: 'inherit'});
  }

  // Run Metro bundler in a separate process
  console.log('\n📱 Starting Metro bundler...');
  const metro = require('child_process').spawn('npx', ['react-native', 'start']);

  // Run Android tests
  console.log('\n🤖 Running Android tests...');
  try {
    execSync('npx react-native run-android', {stdio: 'inherit'});
    console.log('✅ Android tests passed');
  } catch (error) {
    console.error('❌ Android tests failed:', error);
    process.exit(1);
  }

  // Run iOS tests if on macOS
  if (process.platform === 'darwin') {
    console.log('\n🍎 Running iOS tests...');
    try {
      execSync('cd ios && pod install && cd ..', {stdio: 'inherit'});
      execSync('npx react-native run-ios', {stdio: 'inherit'});
      console.log('✅ iOS tests passed');
    } catch (error) {
      console.error('❌ iOS tests failed:', error);
      process.exit(1);
    }
  }

  // Kill Metro bundler
  metro.kill();
  console.log('\n🎉 All tests completed successfully!');
};

runTests(); 