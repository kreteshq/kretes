const IsModule = /^\/@modules\//
const IsFeature = /^@\//
const IsFeaturesImport = /^([A-Z][\.\w\/-]+)/
const IsExternalImport = /^[^A-Z\/\.]/
const IsSpecialImport = /^@modules/
const IsHTMLScriptBody = /(<script\b[^>]*>)([\s\S]*?)<\/script>/gm
const IsHTMLScriptSource = /\bsrc=(?:"([^"]+)"|'([^']+)'|([^'"\s]+)\b)/
const IsQuotedString = /^(?:'([^']+)'|"([^"]+)")$/
const HasExtension = /\.\w+/
const IsHotReloadImport = /^kretes\/hot/
const IsExternalURL = /^https?:\/\//
const IsRelative = /^\.\//

export default {
  IsModule,
  IsFeature,
  IsFeaturesImport,
  IsExternalImport,
  IsSpecialImport,
  IsHTMLScriptBody,
  IsHTMLScriptSource,
  IsQuotedString,
  HasExtension,
  IsHotReloadImport,
  IsExternalURL,
  IsRelative,
}
