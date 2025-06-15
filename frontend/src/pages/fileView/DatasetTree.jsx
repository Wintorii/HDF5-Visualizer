import React, { useState } from 'react';
import clsx from 'clsx';
import RightChevronIcon from '../dashboard/lib/assets/right-chevron.svg';
import styles from './FileView.module.scss';

/**
 * Tree view component for displaying dataset hierarchy
 */
export const DatasetTree = ({ nodes, selectedPath, onSelect, prefix = '' }) => (
  <div className={styles.treeContainer}>
    {nodes.map(node => (
      <DatasetTreeNode
        key={`${prefix}/${node.name}`}
        node={node}
        path={`${prefix}/${node.name}`}
        selectedPath={selectedPath}
        onSelect={onSelect}
        level={prefix.split('/').length - 1}
      />
    ))}
  </div>
);

/**
 * Individual node component in the dataset tree
 */
const DatasetTreeNode = ({ node, path, selectedPath, onSelect, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = path === selectedPath;
  const isGroup = node.type === 'group';

  const handleNodeClick = (e) => {
    if (isGroup) {
      setIsExpanded(prev => !prev);
    } else {
      onSelect(path);
    }
  };

  return (
    <div 
      className={styles.treeNode} 
      style={{ paddingLeft: `${level * 16}px` }}
    >
      <div
        className={clsx(styles.treeNodeLabel, {
          [styles.selected]: isSelected,
          [styles.group]: isGroup
        })}
        onClick={handleNodeClick}
      >
        {isGroup && (
          <img 
            src={RightChevronIcon} 
            alt='icon' 
            className={clsx(styles.arrow, {
              [styles.expanded]: isExpanded
            })}
          />
        )}
        <span
          className={clsx(styles.nodeName, {
            [styles.selectedLeaf]: isSelected && !isGroup
          })}
        >
          {node.name}
        </span>
      </div>

      {isGroup && isExpanded && node.children && (
        <div className={styles.treeChildren}>
          {node.children.map(child => (
            <DatasetTreeNode
              key={`${path}/${child.name}`}
              node={child}
              path={`${path}/${child.name}`}
              selectedPath={selectedPath}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 