export function formatQuickMessage(jsonString: string, user: string, page: string) {
  return jsonString
    .replace(/{{gender}}/g, 'Anh/Chị')
    .replace(/{{full_name}}/g, user)
    .replace(/{{page_name}}/g, page);
}
