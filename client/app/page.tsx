
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {

  const datasets = ['Physionet'];
  const missingness = ['MAR', 'MCAR', 'MNAR'];
  const models = ['I-NAA'];
  const proportions = ['10%', '20%', '30%', '40%', '50%'];
  
  // Sample results data - green cells have lower NRMSE than red cells
  const results = {
    Physionet: {
      MAR: {
        'I-NAA': {
          existing: [false, true, true, true, true],
          proposed: [true, true, false, false, true]
        }
      },
      MCAR: {
        'I-NAA': {
          existing: [true, true, false, true, true],
          proposed: [false, true, true, true, false]
        }
      },
      MNAR: {
        'I-NAA': {
          existing: [true, false, false, true, false],
          proposed: [false, true, true, false, true]
        }
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-center mb-8">Model Evaluation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proposed model selectors */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Proposed model</h2>
          
          <Select defaultValue={datasets[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map(dataset => (
                <SelectItem key={dataset} value={dataset}>{dataset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={missingness[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Missingness mechanism" />
            </SelectTrigger>
            <SelectContent>
              {missingness.map(mechanism => (
                <SelectItem key={mechanism} value={mechanism}>{mechanism}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={proportions[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Proportion" />
            </SelectTrigger>
            <SelectContent>
              {proportions.map(proportion => (
                <SelectItem key={proportion} value={proportion}>{proportion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* VS. text in the middle for larger screens */}
        <div className="hidden md:flex items-center justify-center">
          <span className="text-lg font-bold">VS.</span>
        </div>
        
        {/* "VS." text for mobile */}
        <div className="md:hidden flex items-center justify-center">
          <span className="text-lg font-bold">VS.</span>
        </div>
        
        {/* Existing models selectors */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Existing models</h2>
          
          <Select defaultValue={models[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={datasets[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map(dataset => (
                <SelectItem key={dataset} value={dataset}>{dataset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={missingness[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Missingness mechanism" />
            </SelectTrigger>
            <SelectContent>
              {missingness.map(mechanism => (
                <SelectItem key={mechanism} value={mechanism}>{mechanism}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={proportions[0]}>
            <SelectTrigger className="w-full h-10 bg-gray-200">
              <SelectValue placeholder="Proportion" />
            </SelectTrigger>
            <SelectContent>
              {proportions.map(proportion => (
                <SelectItem key={proportion} value={proportion}>{proportion}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="mt-12">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="border border-gray-300 p-2 text-left">Dataset</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={5}>Physionet</th>
                </tr>
                <tr className="bg-white">
                  <th className="border border-gray-300 p-2 text-left">Missingness Mechanism</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={5}>MAR</th>
                </tr>
                <tr className="bg-white">
                  <th className="border border-gray-300 p-2 text-left">Existing model</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={5}>I-NAA</th>
                </tr>
                <tr className="bg-white">
                  <th className="border border-gray-300 p-2 text-left">Proportion</th>
                  {proportions.map(proportion => (
                    <th key={proportion} className="border border-gray-300 p-2 text-center">{proportion}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 text-left">Existing model NRMSE</td>
                  {results.Physionet.MAR['I-NAA'].existing.map((better, idx) => (
                    <td 
                      key={idx} 
                      className={`border border-gray-300 p-2 ${better ? 'bg-green-200' : 'bg-red-200'}`}
                    ></td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 text-left">Proposed model NRMSE</td>
                  {results.Physionet.MAR['I-NAA'].proposed.map((better, idx) => (
                    <td 
                      key={idx} 
                      className={`border border-gray-300 p-2 ${better ? 'bg-green-200' : 'bg-red-200'}`}
                    ></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
