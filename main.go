package main

import (
	"fmt"
	"os"

	"github.com/joaocrleite/my-safe-file/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
