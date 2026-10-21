// CSS Modules: `import styles from './X.module.css'` gives a map from the class names written in the file
// to their scoped names.
declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}

// Global stylesheets (`import '@gpui/styles/main.css'`) have no exports; Vite puts them into js/app.css.
declare module '*.css';
