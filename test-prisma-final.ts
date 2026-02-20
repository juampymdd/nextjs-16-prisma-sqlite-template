import { prisma } from "./app/libs/prisma";

async function main() {
  console.log("Checking Task fields...");
  // @ts-ignore
  const task = await prisma.task.findFirst({
    include: {
      comments: true,
    }
  }).catch((e) => {
    console.error("ERROOR:", e.message);
  });
  
  if (task !== undefined) {
    console.log("SUCCESS: Comments field is available!");
  }
}

main();
