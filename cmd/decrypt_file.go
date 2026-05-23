package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/joaocrleite/my-safe-file/internal/crypto"
	"github.com/spf13/cobra"
)

var decryptFileCmd = &cobra.Command{
	Use:   "decrypt-file <file>",
	Short: "Decrypt a file with a password",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		inputPath := args[0]
		password, _ := cmd.Flags().GetString("password")
		outputPath, _ := cmd.Flags().GetString("output")

		if outputPath == "" {
			outputPath = strings.TrimSuffix(inputPath, ".vault")
			if outputPath == inputPath {
				outputPath = inputPath + ".dec"
			}
		}

		ciphertext, err := os.ReadFile(inputPath)
		if err != nil {
			return fmt.Errorf("could not read file: %w", err)
		}

		plaintext, err := crypto.Decrypt(string(ciphertext), password, crypto.DefaultConfig)
		if err != nil {
			return err
		}

		if err := os.WriteFile(outputPath, []byte(plaintext), 0600); err != nil {
			return fmt.Errorf("could not write output file: %w", err)
		}

		fmt.Printf("decrypted: %s -> %s\n", inputPath, outputPath)
		return nil
	},
}

func init() {
	decryptFileCmd.Flags().StringP("password", "p", "", "Password used to decrypt (required)")
	decryptFileCmd.Flags().StringP("output", "o", "", "Output file path (default: strip .vault extension)")
	decryptFileCmd.MarkFlagRequired("password")
	rootCmd.AddCommand(decryptFileCmd)
}
