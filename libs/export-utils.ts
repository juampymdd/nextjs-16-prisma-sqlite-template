import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Task } from "./store/useTaskStore";

export const exportToPDF = (tasks: Task[]) => {
  const doc = new jsPDF();

  const tableRows = tasks.map((task) => [
    task.title,
    task.completed ? "Completada" : "Pendiente",
    task.priority.toUpperCase(),
    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-",
    new Date(task.createdAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    head: [["Título", "Estado", "Prioridad", "Vencimiento", "Creado"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Brand color
  });

  doc.save(`tareas-${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportToExcel = (tasks: Task[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    tasks.map((t) => ({
      Título: t.title,
      Descripción: t.description || "",
      Estado: t.completed ? "Completada" : "Pendiente",
      Prioridad: t.priority,
      "Fecha de Vencimiento": t.dueDate || "-",
      Creado: t.createdAt,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tareas");
  XLSX.writeFile(
    workbook,
    `tareas-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
