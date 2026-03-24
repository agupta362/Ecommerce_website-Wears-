import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Activity, MapPin, DollarSign } from 'lucide-react';
import NCMApiHealth from '@/components/admin/NCMApiHealth';
import NCMBranchList from '@/components/admin/NCMBranchList';
import NCMRateZones from '@/components/admin/NCMRateZones';
import NCMActivityLog from '@/components/admin/NCMActivityLog';

const AdminNCMSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6" />
          NCM Shipping Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage Nepal Can Move integration, branches, and shipping rates
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">API Health</span>
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Branches</span>
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Rate Zones</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <NCMApiHealth />
        </TabsContent>

        <TabsContent value="branches" className="mt-6">
          <NCMBranchList />
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <NCMRateZones />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <NCMActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNCMSettings;
