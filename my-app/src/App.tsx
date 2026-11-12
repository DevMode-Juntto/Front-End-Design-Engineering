import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";
import Rodape from "./components/Rodape/Rodape";

export default function App() {
  return (
    <div className="App">
      <Menu />
      <Outlet />
      <Rodape />
    </div>
  );
}
