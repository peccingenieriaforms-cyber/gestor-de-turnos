import { GoogleGenAI } from "@google/genai";
import { Task, TaskStatus, User } from "../types";

export const generateShiftReport = async (
  apiKey: string,
  user: User,
  tasks: Task[]
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Clave API no configurada.");
  }

  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);

  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('es-ES');

  const completedText = completedTasks.map(t => 
    `- ${t.title} (${t.category}): ${t.notes || 'Sin notas adicionales.'}`
  ).join('\n');

  const pendingText = pendingTasks.map(t => 
    `- ${t.title} (Prioridad: ${t.priority})`
  ).join('\n');

  const prompt = `
    Actúa como un asistente administrativo profesional. Tu tarea es redactar un informe de entrega de turno formal y coherente en español.
    
    **Datos del Turno:**
    - Empleado: ${user.fullName}
    - Fecha: ${currentDate}
    - Hora de corte: ${currentTime}
    
    **Tareas Completadas y Observaciones:**
    ${completedText || "Ninguna tarea completada en este periodo."}
    
    **Pendientes para el siguiente turno:**
    ${pendingText || "No quedan tareas pendientes asignadas."}
    
    **Instrucciones de redacción:**
    1. Genera un solo párrafo narrativo fluido (no una lista con viñetas, integra la información en el texto).
    2. Empieza con un saludo formal indicando la fecha y horario.
    3. Resume las tareas completadas destacando las notas/observaciones si existen.
    4. Menciona claramente qué queda pendiente.
    5. Termina con un cierre profesional y el nombre del empleado.
    6. El tono debe ser corporativo y eficiente.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7, // Balance between creativity and structure
      }
    });
    
    return response.text || "Error: No se pudo generar el texto.";
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
