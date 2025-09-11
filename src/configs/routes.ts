import { LayoutMessages } from '~/components/Layout/LayoutMessages';
import { LayoutModal } from '~/components/Layout/LayoutModal';
import { AccessToStore } from '~/screens/AccessToStore';
import { BarcodeScanner } from '~/screens/BarcodeScanner';
import { Devices } from '~/screens/Devices';
import { Home } from '~/screens/Home';
import { Login } from '~/screens/Login';
import Messages from '~/screens/Messages';
import { NotFound } from '~/screens/NotFound';
import { Order } from '~/screens/Order';
import { OrderDetail } from '~/screens/OrderDetail';
import { Profile } from '~/screens/Profile';
import { Report } from '~/screens/Report';
import Search from '~/screens/Search';
import { Settings } from '~/screens/Settings';
import { GradientBackground } from '../components/GradientBackground';
import { LayoutSidebar } from '../components/Layout/LayoutWithSideBar';
import MessageOrder from '~/screens/MessageOrder';
import MessageCreateOrder from '~/screens/MessageCreateOrder';
import MessageStaff from '~/screens/MessageStaff';
import { Purchase } from '~/screens/Purchase';
import { Packages } from '~/screens/Packages/Packages';
import { ServiceSelection } from '~/screens/ServiceSelection';
import { POSNavigator } from '~/navigation/POSNavigator';
import PrinterConnect from '~/screens/POS/Print';

export interface RouteConfig {
  name: string;
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  options?: any;
  linking?: any;
  isPrivate?: boolean;
  back?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    name: 'Login',
    component: Login,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    linking: {
      path: 'register/:registerData?',
    },
  },
  {
    name: 'Print',
    component: PrinterConnect,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    back: true,
    linking: {
      path: 'print/:printData?',
    },
  },
];

export const privateRoutes: RouteConfig[] = [
  {
    name: 'HomeTabs',
    component: Home,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'AccessToStore',
    component: AccessToStore,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'ServiceSelection',
    component: ServiceSelection,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
    back: true,
  },
  {
    name: 'POSTabs',
    component: POSNavigator,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Packages',
    component: Packages,
    layout: LayoutModal,
    options: {
      headerShown: false,
    },
    back: true,
    isPrivate: true,
  },

  {
    name: 'Purchase',
    component: Purchase,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    back: true,
    isPrivate: true,
  },
  {
    name: 'Messages',
    component: Messages,
    layout: LayoutMessages,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Report',
    component: Report,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Order',
    component: Order,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Search',
    component: Search,
    layout: GradientBackground,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    back: true,
    isPrivate: true,
  },
  {
    name: 'Settings',
    component: Settings,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Profile',
    component: Profile,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    back: true,
    isPrivate: true,
  },
  {
    name: 'Devices',
    component: Devices,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    back: true,
    isPrivate: true,
  },
  {
    name: 'BarcodeScanner',
    component: BarcodeScanner,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    back: true,
    isPrivate: true,
  },
  {
    name: 'OrderDetail',
    component: OrderDetail,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    isPrivate: true,
    back: true,
  },
  {
    name: 'MessageOrder',
    component: MessageOrder,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    isPrivate: true,
    back: true,
  },
  {
    name: 'MessageCreateOrder',
    component: MessageCreateOrder,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    isPrivate: true,
    back: true,
  },
  {
    name: 'MessageStaff',
    component: MessageStaff,
    layout: LayoutModal,
    options: {
      headerShown: false,
      presentation: 'modal',
    },
    isPrivate: true,
    back: true,
  },
  {
    name: 'NotFound',
    component: NotFound,
    layout: GradientBackground,
    options: {
      title: '404',
    },
    linking: {
      path: '*',
    },
    isPrivate: true,
  },
];

export const routes = [...publicRoutes, ...privateRoutes];
