package com.sytac.caseapocalypse.dao;

import com.sytac.caseapocalypse.model.db.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface TemplateDao extends JpaRepository<Template, Long> {
    Template findByName(String name);
}
