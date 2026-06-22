export async function handleMultipleDocumentRequest(requestFunction) {
  let docs = await requestFunction();
  let docsWithIds = [];
  docs = docs.forEach(doc => docsWithIds.push({id: doc.id, ...doc.data()}));
  return docsWithIds;
}

export async function handleSingleDocumentRequest(requestFunction) {
  let doc = await requestFunction();
  let docWithId = {id: doc.id, ...doc.data()};
  return docWithId;
}
