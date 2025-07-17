import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import general from './general';
import guest from './guest';
import rsvp from './rsvp';

const Tab = createMaterialTopTabNavigator();




export default function ManageEventLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="General" component={general} />
      <Tab.Screen name="RSVP" component={rsvp} />
      <Tab.Screen name='Guest' component={guest} />
    </Tab.Navigator>
  )
}
