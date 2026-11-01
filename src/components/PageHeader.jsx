import { useOutletContext } from "react-router";
import ProjectBar from "./ProjectBar";

export default function PageHeader({ eyebrow, title, children }) {
  const { addProject } = useOutletContext();
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="title-row">
          <h1>{title}</h1>
          {children}
        </div>
      </div>
      <ProjectBar onAddProject={addProject} />
    </div>
  );
}
