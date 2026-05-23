package cmd

import (
	"fmt"
	"os"

	"github.com/joaocrleite/my-safe-file/internal/crypto"
	"github.com/spf13/cobra"
)

var encryptFileCmd = &cobra.Command{
	Use:   "encrypt-file <file>",
	Short: "Encrypt a file with a password",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		inputPath := args[0]
		password, _ := cmd.Flags().GetString("password")
		outputPath, _ := cmd.Flags().GetString("output")

		if outputPath == "" {
			outputPath = inputPath + ".vault"
		}

		plaintext, err := os.ReadFile(inputPath)
		if err != nil {
			return fmt.Errorf("could not read file: %w", err)
		}

		encrypted, err := crypto.Encrypt(string(plaintext), password, crypto.DefaultConfig)
		if err != nil {
			return fmt.Errorf("encryption failed: %w", err)
		}

		if err := os.WriteFile(outputPath, []byte(encrypted), 0600); err != nil {
			return fmt.Errorf("could not write output file: %w", err)
		}

		fmt.Printf("encrypted: %s -> %s\n", inputPath, outputPath)
		return nil
	},
}

func init() {
	encryptFileCmd.Flags().StringP("password", "p", "", "Password used to encrypt (required)")
	encryptFileCmd.Flags().StringP("output", "o", "", "Output file path (default: <file>.vault)")
	encryptFileCmd.MarkFlagRequired("password")
	rootCmd.AddCommand(encryptFileCmd)
}
