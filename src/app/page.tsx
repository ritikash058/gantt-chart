
import Gantt from "@/components/Chart";
import { sampleTasks } from "@/data";

export default function Home() {
  return (
    <div className="p-4">
        <Gantt tasks={sampleTasks} />
    </div>
  );
}
