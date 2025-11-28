import fs from 'fs';
import path from 'path';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Replace imports with versions
            // Matches: from "package@version" or from 'package@version'
            // Also handles scoped packages like @radix-ui/react-tooltip@1.1.8
            // Regex explanation:
            // from\s+['"] : starts with from " or from '
            // ( : start capture group 1
            //   (?:@[^/'"]+\/)? : optional scope (e.g. @radix-ui/)
            //   [^/'"]+ : package name
            // ) : end capture group 1
            // @[\d\.]+ : version part (e.g. @1.1.8)
            // ['"] : ending quote

            const regex = /from\s+['"]((?:@[^/'"]+\/)?[^/'"]+)@[\d\.]+['"]/g;

            if (regex.test(content)) {
                console.log(`Fixing imports in ${filePath}`);
                content = content.replace(regex, (match, pkg) => {
                    return `from "${pkg}"`;
                });
                fs.writeFileSync(filePath, content);
            }
        }
    }
}

walk('./src');
