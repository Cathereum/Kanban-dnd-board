import "./App.scss";
import { KanbanBoard } from "./components/KanbanBoard/KanbanBoard";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <Layout>
      <KanbanBoard />
    </Layout>
  );
}

export default App;
