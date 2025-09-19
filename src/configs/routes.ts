import { LayoutModal } from '~/components/Layout/LayoutModal';
import { AccessToStore } from '~/screens/AccessToStore';
import { BarcodeScanner } from '~/screens/BarcodeScanner';
import { Devices } from '~/screens/Devices';
import { Login } from '~/screens/Login';
import { NotFound } from '~/screens/NotFound';
import { Packages } from '~/screens/Packages/Packages';
import PrinterConnect from '~/screens/Print';
import { Profile } from '~/screens/Profile';
import { Purchase } from '~/screens/Purchase';
import { GradientBackground } from '../components/GradientBackground';
import { LayoutSidebar } from '../components/Layout/LayoutWithSideBar';
import { Cashier } from '~/screens/Cashier';
import { POSInventory } from '~/screens/Inventory';
import { POSReports } from '~/screens/Reports';
import { POSSettings } from '~/screens/Settings';

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
    name: 'AccessToStore',
    component: AccessToStore,
    layout: LayoutSidebar,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'HomeTabs',
    component: Cashier,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'POSInventory',
    component: POSInventory,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'POSReports',
    component: POSReports,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'POSSettings',
    component: POSSettings,
    layout: GradientBackground,
    options: {
      headerShown: false,
    },
    isPrivate: true,
  },
  {
    name: 'Packages',
    component: Packages,
    layout: GradientBackground,
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
