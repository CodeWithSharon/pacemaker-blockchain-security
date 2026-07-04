"""
Generate Research Paper Figures with Updated Color Schemes
==========================================================
This script generates three figures for the research paper:
1. Figure 1: Scenario-wise transaction success and failure (Orange & Yellow)
2. Figure 2: Combined Security Threats & Latency Distribution (Blue & Orange)
"""

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle

# Set the style for better-looking plots
plt.style.use('seaborn-v0_8-darkgrid')

def generate_figure1():
    """
    Figure 1: Scenario-wise Transaction Success and Failure Analysis
    Colors: Modern Blue and Coral (professional and visually appealing)
    """
    # Data from the scenarios
    scenarios = ['Authorized\nAccess', 'Unauthorized\nAccess', 'Malicious\nCommand', 
                 'Replay\nAttack', 'Rate\nLimiting', 'Abnormal\nFrequency']
    
    # Transaction counts (success, blocked/failed)
    successful = [30, 0, 0, 10, 23, 0]
    blocked = [0, 25, 30, 15, 7, 25]
    success_rates = [100.0, 0.0, 0.0, 40.0, 76.7, 0.0]
    
    # Modern professional colors: vibrant blue and coral
    color_success = '#FF9800'  # Orange for success
    color_blocked = '#FFEB3B'  # Yellow for blocked/failed
    
    # Create figure with white background
    fig, ax = plt.subplots(figsize=(15, 9), facecolor='white')
    ax.set_facecolor('#F8F9FA')  # Light gray background
    
    x = np.arange(len(scenarios))
    width = 0.38
    
    # Create bars with gradient effect using alpha
    bars1 = ax.bar(x - width/2, successful, width, label='Successful Transactions', 
                   color=color_success, edgecolor='#E65100', linewidth=1.5, alpha=0.85)
    bars2 = ax.bar(x + width/2, blocked, width, label='Blocked/Failed Transactions', 
                   color=color_blocked, edgecolor='#F57F17', linewidth=1.5, alpha=0.85)
    
    # Add labels and title with improved styling
    ax.set_xlabel('Security Test Scenarios', fontsize=26, fontweight='bold', color='#263238')
    ax.set_ylabel('Number of Transactions', fontsize=26, fontweight='bold', color='#263238')
    # ax.set_title('Figure 1: Scenario-wise Transaction Success and Failure Analysis', 
    #              fontsize=32, fontweight='bold', pad=25, color='#1A237E')
    ax.set_xticks(x)
    ax.set_xticklabels(scenarios, fontsize=20, fontweight='semibold')
    
    # Enhanced legend
    legend = ax.legend(fontsize=20, loc='upper right', framealpha=0.95, 
                      edgecolor='#37474F', fancybox=True, shadow=True)
    legend.get_frame().set_facecolor('#FFFFFF')    
    # Increase y-axis tick label size
    ax.tick_params(axis='y', labelsize=18)    
    # Add success rate annotations with improved background
    for i, rate in enumerate(success_rates):
        total = successful[i] + blocked[i]
        y_pos = max(successful[i], blocked[i]) + 2.5
        
        # Add text with enhanced background box
        bbox_props = dict(boxstyle='round,pad=0.6,rounding_size=0.2', facecolor='#FFF9C4', 
                         edgecolor='#F57F17', linewidth=2, alpha=0.95)
        ax.text(i, y_pos, f'{rate:.1f}%', ha='center', va='bottom', 
               fontsize=20, fontweight='bold', bbox=bbox_props, color='#33691E')
    
    # Add value labels on top of bars
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            if height > 0:  # Only show label if bar has value
                ax.text(bar.get_x() + bar.get_width()/2., height/2,
                       f'{int(height)}', ha='center', va='center',
                       fontsize=18, fontweight='bold', color='black')
    
    # Enhanced grid
    ax.grid(True, alpha=0.25, linestyle='--', linewidth=0.8, axis='y', color='#455A64')
    ax.set_axisbelow(True)
    
    # Set y-axis limit with some padding
    ax.set_ylim(0, max(max(successful), max(blocked)) + 8)
    
    # Add subtle border
    for spine in ax.spines.values():
        spine.set_edgecolor('#37474F')
        spine.set_linewidth(1.5)
    
    # Adjust layout
    plt.tight_layout()
    plt.savefig('Figure1_Scenario_Performance.png', dpi=300, bbox_inches='tight', facecolor='white')
    print("✅ Figure 1 saved as 'Figure1_Scenario_Performance.png'")
    plt.close()


def generate_figure2_merged():
    """
    Figure 2: Merged Security Threat Breakdown and Latency Distribution
    Colors: Blue and Orange (comfortable to eyes)
    """
    # Create figure with two subplots side by side
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    
    # ===== LEFT SUBPLOT: Security Threat Breakdown =====
    threat_types = ['Malicious\nCommand', 'Abnormal\nFrequency', 'Unauthorized\nAccess', 
                    'Replay\nAttempts', 'Invalid\nCommands']
    threat_counts = [25, 18, 15, 10, 6]
    total_threats = sum(threat_counts)
    percentages = [(count/total_threats)*100 for count in threat_counts]
    
    # Comfortable blue shades
    color_threats = '#42A5F5'  # Soft blue
    
    # Create bars
    bars = ax1.bar(threat_types, threat_counts, color=color_threats, 
                   edgecolor='black', linewidth=1.2)
    
    # Add labels
    ax1.set_xlabel('Threat Categories', fontsize=22, fontweight='bold')
    ax1.set_ylabel('Number of Threats Detected', fontsize=22, fontweight='bold')
    # ax1.set_title('Security Threat Detection Breakdown', fontsize=22, fontweight='bold', pad=15)
    
    # Add percentage annotations
    for i, (bar, pct) in enumerate(zip(bars, percentages)):
        height = bar.get_height()
        bbox_props = dict(boxstyle='round,pad=0.4', facecolor='#90CAF9', 
                         edgecolor='black', linewidth=1.2, alpha=0.9)
        ax1.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{pct:.1f}%', ha='center', va='bottom', 
                fontsize=18, fontweight='bold', bbox=bbox_props)
    
    ax1.grid(True, alpha=0.3, linestyle='--', axis='y')
    ax1.set_axisbelow(True)
    ax1.tick_params(axis='x', labelsize=18)
    ax1.tick_params(axis='y', labelsize=18)
    
    # Set y-axis limit to prevent annotations from going outside
    ax1.set_ylim(0, max(threat_counts) + 5)
    
    # ===== RIGHT SUBPLOT: Latency Distribution =====
    metrics = ['Mean', 'Median', 'Min', 'Max', '95th\nPercentile', '99th\nPercentile']
    latencies = [245.67, 198.34, 45.23, 892.15, 568.42, 756.89]
    
    # Color coding: Blue for good, Orange for acceptable, Red for outliers
    colors = []
    threshold = 250  # Acceptable threshold in ms
    
    for lat in latencies:
        if lat < threshold:
            colors.append('#1976D2')  # Deep blue - excellent
        elif lat < 500:
            colors.append('#FF9800')  # Warm orange - acceptable
        else:
            colors.append('#FF9800')  # Keep orange for consistency
    
    # Create bars
    bars = ax2.bar(metrics, latencies, color=colors, edgecolor='black', linewidth=1.2)
    
    # Add threshold line
    ax2.axhline(y=threshold, color='#4CAF50', linestyle='--', linewidth=2.5, 
                label=f'Acceptable Threshold ({threshold} ms)', alpha=0.8)
    
    # Add labels
    ax2.set_xlabel('Latency Metrics', fontsize=22, fontweight='bold')
    ax2.set_ylabel('Response Time (milliseconds)', fontsize=22, fontweight='bold')
    # ax2.set_title('Transaction Latency Distribution Analysis', fontsize=22, fontweight='bold', pad=15)
    ax2.legend(fontsize=18, loc='upper left')
    
    # Add value annotations
    for i, (bar, lat) in enumerate(zip(bars, latencies)):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 20,
                f'{lat:.1f}\nms', ha='center', va='bottom', 
                fontsize=17, fontweight='bold')
    
    ax2.grid(True, alpha=0.3, linestyle='--', axis='y')
    ax2.set_axisbelow(True)
    ax2.tick_params(axis='x', labelsize=18)
    ax2.tick_params(axis='y', labelsize=18)
    
    # Set y-axis limit to prevent annotations from going outside and avoid overlap with threshold
    ax2.set_ylim(0, max(latencies) + 220)
    
    # Overall title
    # fig.suptitle('Figure 2: Security & Performance Analysis', 
    #              fontsize=24, fontweight='bold', y=0.98)
    
    # Adjust layout
    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.savefig('Figure2_Security_and_Latency_Merged.png', dpi=300, bbox_inches='tight')
    print("✅ Figure 2 (Merged) saved as 'Figure2_Security_and_Latency_Merged.png'")
    plt.close()


def main():
    """Generate all figures"""
    print("=" * 80)
    print("Generating Research Paper Figures")
    print("=" * 80)
    print()
    
    print("📊 Generating Figure 1: Scenario Performance (Orange & Yellow)...")
    generate_figure1()
    print()
    
    print("📊 Generating Figure 2: Security & Latency Merged (Blue & Orange)...")
    generate_figure2_merged()
    print()
    
    print("=" * 80)
    print("✅ All figures generated successfully!")
    print("=" * 80)
    print()
    print("Generated files:")
    print("  1. Figure1_Scenario_Performance.png")
    print("  2. Figure2_Security_and_Latency_Merged.png")
    print()


if __name__ == "__main__":
    main()
