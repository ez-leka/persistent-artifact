#!/bin/bash
npm run package
git commit -m  $1 --all    
git push 
git tag -f v1
git push -f --tags  