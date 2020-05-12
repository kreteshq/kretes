const IsModule = /^\/@modules\//
const IsFeaturesImport = /^([A-Z][\.\w\/-]+)/
const IsExternalImport = /^[^A-Z@\/\.]/
const IsSpecialImport = /^@/
const IsHTMLScriptBody = /(<script\b[^>]*>)([\s\S]*?)<\/script>/gm
const IsHTMLScriptSource = /\bsrc=(?:"([^"]+)"|'([^']+)'|([^'"\s]+)\b)/
const IsQuotedString = /^(?:'([^']+)'|"([^"]+)")$/
const HasExtension = /\.\w+/
const IsHotReloadImport = /^kretes\/hot/
const IsExternalURL = /^https?:\/\//

export default {
  IsModule,
  IsFeaturesImport,
  IsExternalImport,
  IsSpecialImport,
  IsHTMLScriptBody,
  IsHTMLScriptSource,
  IsQuotedString,
  HasExtension,
  IsHotReloadImport,
  IsExternalURL,
}
