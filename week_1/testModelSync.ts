import User from './src/models/User';
import Destination from './src/models/Destination';

async function testSync() {
  try {
    await User.sync();
    console.log('User model synced successfully');
    await Destination.sync();
    console.log('Destination model synced successfully');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
}

testSync(); 