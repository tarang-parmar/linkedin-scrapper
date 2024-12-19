export async function waitForTimeout(duration) {
  await new Promise((resolve) => setTimeout(resolve, duration))
}
