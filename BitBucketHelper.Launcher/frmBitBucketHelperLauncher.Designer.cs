namespace BitBucketHelper.Launcher
{
    partial class frmBitBucketHelperLauncher
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            SuspendLayout();
            //
            // frmBitBucketHelperLauncher
            //
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1280, 800);
            MinimumSize = new Size(960, 600);
            Name = "frmBitBucketHelperLauncher";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "BitBucket Helper";
            Load += frmBitBucketHelperLauncher_Load;
            FormClosing += frmBitBucketHelperLauncher_FormClosing;
            ResumeLayout(false);
        }

        #endregion
    }
}
