import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import General from './general';
import Guest from './guest';
import RSVP from './rsvp';

const Tab = createMaterialTopTabNavigator();




export default function ManageEventLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="RSVP" component={RSVP} />
      <Tab.Screen name='Guest' component={Guest} />
      <Tab.Screen name="Settings" component={General} />
    </Tab.Navigator>
  )
}
