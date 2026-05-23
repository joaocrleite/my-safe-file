package cmd

import (
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:           "my-safe-file",
	Short:         "Symmetric encryption and decryption tool",
	Long:          "my-safe-file encrypts and decrypts text using a password, similar to GPG symmetric mode.",
	SilenceUsage:  true,
	SilenceErrors: true,
}

func Execute() error {
	return rootCmd.Execute()
}
