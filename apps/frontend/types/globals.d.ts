// Ambient declarations so `tsc --checkJs` understands non-code imports
// without depending on generated files under .next/.

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
