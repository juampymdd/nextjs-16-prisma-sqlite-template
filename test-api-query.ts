import { prisma } from "./app/libs/prisma";

async function test() {
  try {
    const userId = "k4MLwzybIzSbtQb1KCu5NlkMuiXypiLo"; // Taken from db-output.txt earlier
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { userId: userId },
          { collaborators: { some: { userId: userId } } },
        ],
      },
      include: {
        subtasks: true,
        attachments: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
    console.log("SUCCESS: Found", tasks.length, "tasks");
  } catch (error: any) {
    console.error("FAILURE:", error.message);
    if (error.stack) console.error(error.stack);
  }
}

test();
