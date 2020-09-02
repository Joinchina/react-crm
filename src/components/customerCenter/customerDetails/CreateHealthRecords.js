import { createDecorator, MainRenderer, SaveBarRenderer, } from './HealthRecord';
import PrintRenderer from './HealthRecord/print-bar-renderer/PrintRenderer';
import PrintBarRender from './HealthRecord/print-bar-renderer/PrintBarRenderer';

export default function createHealthRecordComponents(patientId) {
  const dec = createDecorator(patientId);
  const Main = dec(MainRenderer);
  const Save = dec(SaveBarRenderer);
  const Print = dec(PrintRenderer);
  const PrintBar = dec(PrintBarRender);
  return {
    Main,
    Save,
    Print,
    PrintBar,
  };
}
